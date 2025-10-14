import { BotIcon, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ChatSwitcher } from "./chat-selector";

export const EmptyChatWindow = ({
  onCreate,
  onSelectChatId,
  chats,
}: {
  onCreate?: () => void;
  onSelectChatId: (chadId: string) => void;
  chats: string[];
}) => {
  return (
    <Card className="flex-1 flex flex-col h-full pb-0">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BotIcon className="h-6 w-6" />
              MOAI Chat Assistant
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCreate}
              className="flex items-center gap-2"
            >
              <Plus className="size-4" />
              New Chat
            </Button>
            <ChatSwitcher chats={chats} onSelect={onSelectChatId} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex w-full items-center justify-center">
        <div className="text-center text-muted-foreground py-12">
          <div className="relative">
            <BotIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Welcome to MOAI Chat</h3>
          <p className="text-sm mb-4 max-w-md mx-auto">
            Your intelligent assistant for mathematical optimization and AI
            insights. Start a conversation by typing a message below.
          </p>
          <div className="flex items-center justify-center">
            <Button
              variant="default"
              size="sm"
              onClick={onCreate}
              className="flex items-center gap-2"
            >
              <Plus className="size-4" />
              Create a new Chat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
