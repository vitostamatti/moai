import { getNodeDisplayText } from "../expression/utils";
import { ObjectiveDefinition } from "./objective-schema";

// Objective preview
export const getObjectivePreview = (objective: ObjectiveDefinition): string => {
  try {
    const expression = getNodeDisplayText(objective.expression);
    const type = objective.type === "minimize" ? "minimize" : "maximize";
    return `${type} ${expression}`;
  } catch {
    return "Invalid objective structure";
  }
};
