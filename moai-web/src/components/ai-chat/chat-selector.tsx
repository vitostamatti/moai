import { HistoryIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type ChatSwitcherProps = {
  chats: string[];
  onSelect: (chatId: string) => void;
};
export const ChatSwitcher = (props: ChatSwitcherProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={"sm"} variant={"outline"}>
          <HistoryIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        align="start"
        side={"left"}
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-muted-foreground text-xs">
          Chats
        </DropdownMenuLabel>
        {props.chats.map((id, idx) => (
          <DropdownMenuItem
            key={idx}
            onClick={() => props.onSelect(id)}
            className="gap-2 p-2"
          >
            {id}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
