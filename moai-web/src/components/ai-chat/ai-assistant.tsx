"use client";

import { useEffect } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { convertToUIMessages } from "@/lib/chat/utils";
import { ChatWindow } from "./chat-window";
import { EmptyChatWindow } from "./empty-chat-window";
import { CreateSetDefinitionSchema } from "@/lib/editor/set/set-schema";

type ChatsProps = {
  onSetToolCall?: (set: CreateSetDefinitionSchema) => void;
};

export const AIAssistant = (props: ChatsProps) => {
  const trpc = useTRPC();

  const [chatId, setChatId] = useQueryState("chatId", {
    defaultValue: "",
  });

  // Fetch chat list for history
  const { data: chatList } = useSuspenseQuery(
    trpc.chat.list.queryOptions({ limit: 5 })
  );

  useEffect(() => {
    if (!chatId && chatList && chatList.length) {
      const latestId = chatList[0].id;
      setChatId(latestId);
    }
  }, [chatList, chatId, setChatId]);

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

  const handleCreateNewChat = () => {
    createChatMutation.mutate(
      {
        title: `Chat ${new Date().toLocaleDateString()}`,
        visibility: "user",
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
  return chatId ? (
    <ChatWindow
      chatId={chatId}
      chats={chatList.map((c) => c.id)}
      initialMessages={displayMessages}
      onCreate={handleCreateNewChat}
      onSelectChatId={setChatId}
      onSetToolCall={props.onSetToolCall}
    />
  ) : (
    <EmptyChatWindow
      chats={chatList.map((c) => c.id)}
      onCreate={handleCreateNewChat}
      onSelectChatId={setChatId}
    />
  );
};
