import React from "react";
import { MILPModel } from "@/lib/editor/model/model-schema";
import { mockModels } from "@/lib/editor/mock-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Database, ArrowRight } from "lucide-react";

interface ModelSelectorProps {
  currentModel: MILPModel;
  onModelSelect: (model: MILPModel) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  currentModel,
  onModelSelect,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="w-5 h-5" />
          Model Selection
        </CardTitle>
        <CardDescription>Choose a model to view and edit</CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          value={currentModel.metadata.id}
          onValueChange={(modelId) => {
            const selectedModel = mockModels.find(
              (m) => m.metadata.id === modelId
            );
            if (selectedModel) {
              onModelSelect(selectedModel);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mockModels.map((model) => (
              <SelectItem key={model.metadata.id} value={model.metadata.id}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{model.metadata.name}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="text-sm text-muted-foreground">
                    {model.metadata.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};
