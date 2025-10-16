"use client";

import { useEffect } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { convertToUIMessages } from "@/lib/ai/utils";
import { AIChat } from "./ai-chat";

type Props = {
  modelId: string;
};
export const AIAssistant = ({ modelId }: Props) => {
  const trpc = useTRPC();

  const [chatId, setChatId] = useQueryState("chatId", {
    defaultValue: "",
  });

  const { data: chatList } = useSuspenseQuery(
    trpc.chat.list.queryOptions({ modelId, limit: 5 })
  );
  const createChatMutation = useMutation(
    trpc.chat.create.mutationOptions({
      onSuccess: (newChat) => {
        setChatId(newChat.id);
      },
      onError: (error) => {
        console.error("Failed to create new chat:", error);
      },
    })
  );

  useEffect(() => {
    if (!chatId) {
      if (chatList && chatList.length) {
        const latestId = chatList[0].id;
        setChatId(latestId);
      } else {
        createChatMutation
          .mutateAsync({
            title: `Chat ${new Date().toLocaleDateString()}`,
            modelId: modelId,
          })
          .then((newChat) => {
            setChatId(newChat.id);
          })
          .catch((error) => {
            console.error("Failed to create new chat:", error);
          });
      }
    }
  }, [chatList, chatId, setChatId]);

  const handleCreateNewChat = () => {
    createChatMutation.mutate(
      {
        title: `Chat ${new Date().toLocaleDateString()}`,
        modelId: modelId,
      },
      {
        onSuccess: (data) => {
          setChatId(data.id);
        },
      }
    );
  };

  const { data: messagesData, isLoading } = useQuery(
    trpc.chat.get.queryOptions(
      { id: chatId },
      {
        enabled: !!chatId,
      }
    )
  );

  const displayMessages = messagesData?.messages
    ? convertToUIMessages(messagesData.messages)
    : [];

  if (isLoading) {
    return <div>Loading chat...</div>;
  }
  return (
    <AIChat
      chatId={chatId}
      modelId={modelId}
      initialMessages={displayMessages}
    />
  );
};
