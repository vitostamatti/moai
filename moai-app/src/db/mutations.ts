import { eq } from "drizzle-orm";
import { db } from "./client";
// import { toPythonIdentifier } from "@/lib/identifiers";
import * as s from "./schema";
import { randomUUID } from "crypto";

// Chat mutations
export async function createChat(data: {
  id?: string;
  title: string;
  userId: string;
  organizationId?: string | null;
  visibility?: "user" | "organization";
}) {
  const [chat] = await db
    .insert(s.chat)
    .values({
      id: data.id ?? randomUUID(),
      title: data.title,
      userId: data.userId,
      createdAt: new Date(),
    })
    .returning();
  return chat;
}

export async function updateChat(
  chatId: string,
  userId: string,
  updates: { title?: string }
) {
  // Verify ownership
  const existing = await db.query.chat.findFirst({
    where: (chat, { and, eq }) =>
      and(eq(chat.id, chatId), eq(chat.userId, userId)),
  });
  if (!existing) throw new Error("Chat not found or access denied");

  const setObj: Partial<s.ChatInserts> = {};
  if (updates.title !== undefined) setObj.title = updates.title;

  const [updated] = await db
    .update(s.chat)
    .set(setObj)
    .where(eq(s.chat.id, chatId))
    .returning();
  return updated;
}

export async function deleteChat(chatId: string, userId: string) {
  // Verify ownership
  const existing = await db.query.chat.findFirst({
    where: (chat, { and, eq }) =>
      and(eq(chat.id, chatId), eq(chat.userId, userId)),
  });
  if (!existing) throw new Error("Chat not found or access denied");

  // Transactionally delete messages, streams, then chat
  // Rely on DB-level ON DELETE CASCADE for messages and streams
  await db.delete(s.chat).where(eq(s.chat.id, chatId));
}

export async function addMessagesToChat({
  messages,
}: {
  messages: Array<s.MessageSelect>;
}) {
  try {
    return await db.insert(s.message).values(messages);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to save messages");
  }
}

// Model mutations
export async function createModel(
  modelData: Omit<s.ModelInserts, "userId"> & { userId: string }
) {
  const [model] = await db.insert(s.model).values(modelData).returning();
  return model;
}

export async function updateModel(
  modelId: string,
  userId: string,
  updates: Partial<Omit<s.ModelInserts, "userId">>
) {
  // Verify ownership before update
  const model = await db.query.model.findFirst({
    where: (models, { and, eq }) =>
      and(eq(models.id, modelId), eq(models.userId, userId)),
  });

  if (!model) {
    throw new Error("Model not found or access denied");
  }

  const [updatedModel] = await db
    .update(s.model)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(s.model.id, modelId))
    .returning();
  return updatedModel;
}

export async function deleteModel(modelId: string, userId: string) {
  // Verify ownership before deletion
  const model = await db.query.model.findFirst({
    where: (models, { and, eq }) =>
      and(eq(models.id, modelId), eq(models.userId, userId)),
  });

  if (!model) {
    throw new Error("Model not found or access denied");
  }

  // Cascade delete will handle all related components
  await db.delete(s.model).where(eq(s.model.id, modelId));
}

// Set mutations
export async function createSet(setData: s.SetInserts) {
  const [set] = await db.insert(s.set).values(setData).returning();
  return set;
}

export async function updateSet(setId: string, updates: Partial<s.SetInserts>) {
  const [set] = await db
    .update(s.set)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(s.set.id, setId))
    .returning();
  return set;
}

export async function deleteSet(setId: string) {
  await db.delete(s.set).where(eq(s.set.id, setId));
}

// Parameter mutations
export async function createParameter(paramData: s.ParameterInserts) {
  const [param] = await db.insert(s.parameter).values(paramData).returning();
  return param;
}

export async function updateParameter(
  parameterId: string,
  updates: Partial<s.ParameterInserts>
) {
  const [param] = await db
    .update(s.parameter)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(s.parameter.id, parameterId))
    .returning();
  return param;
}

export async function deleteParameter(parameterId: string) {
  await db.delete(s.parameter).where(eq(s.parameter.id, parameterId));
}

// Variable mutations
export async function createVariable(varData: s.VariableInserts) {
  const [variable] = await db.insert(s.variable).values(varData).returning();
  return variable;
}

export async function updateVariable(
  variableId: string,
  updates: Partial<s.VariableInserts>
) {
  const [variable] = await db
    .update(s.variable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(s.variable.id, variableId))
    .returning();
  return variable;
}

export async function deleteVariable(variableId: string) {
  await db.delete(s.variable).where(eq(s.variable.id, variableId));
}

// Constraint mutations
export async function createConstraint(constraintData: s.ConstraintInserts) {
  const [constraint] = await db
    .insert(s.constraint)
    .values(constraintData)
    .returning();
  return constraint;
}

export async function updateConstraint(
  constraintId: string,
  updates: Partial<s.ConstraintInserts>
) {
  const [constraint] = await db
    .update(s.constraint)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(s.constraint.id, constraintId))
    .returning();
  return constraint;
}

export async function deleteConstraint(constraintId: string) {
  await db.delete(s.constraint).where(eq(s.constraint.id, constraintId));
}

// Objective mutations
export async function createObjective(objectiveData: s.ObjectiveInserts) {
  // If enabling this objective, disable others for the same model
  if (objectiveData.enabled) {
    await db
      .update(s.objective)
      .set({ enabled: false, updatedAt: new Date() })
      .where(eq(s.objective.modelId, objectiveData.modelId));
  }
  const [objective] = await db
    .insert(s.objective)
    .values(objectiveData)
    .returning();
  return objective;
}

export async function updateObjective(
  objectiveId: string,
  updates: Partial<s.ObjectiveInserts>
) {
  if (updates.enabled === true) {
    // Find modelId of the objective to update others in same model
    const current = await db.query.objective.findFirst({
      where: (objectives, { eq }) => eq(objectives.id, objectiveId),
    });
    if (current) {
      await db
        .update(s.objective)
        .set({ enabled: false, updatedAt: new Date() })
        .where(eq(s.objective.modelId, current.modelId));
    }
  }
  const [objective] = await db
    .update(s.objective)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(s.objective.id, objectiveId))
    .returning();
  return objective;
}

export async function deleteObjective(objectiveId: string) {
  await db.delete(s.objective).where(eq(s.objective.id, objectiveId));
}

// Batch operations for creating complete models
export async function createCompleteModel(milpModel: {
  metadata: Omit<s.ModelInserts, "userId"> & { userId: string };
  sets: s.SetInserts[];
  parameters: s.ParameterInserts[];
  variables: s.VariableInserts[];
  constraints: s.ConstraintInserts[];
  objective: s.ObjectiveInserts;
}) {
  return await db.transaction(async (tx) => {
    // Create the model first
    const [model] = await tx
      .insert(s.model)
      .values(milpModel.metadata)
      .returning();

    // Create all components with the model ID
    const setsWithModelId = milpModel.sets.map((set) => ({
      ...set,
      id: set.id ?? randomUUID(),
      modelId: model.id,
    }));
    const parametersWithModelId = milpModel.parameters.map((param) => ({
      ...param,
      id: param.id ?? randomUUID(),
      modelId: model.id,
    }));
    const variablesWithModelId = milpModel.variables.map((variable) => ({
      ...variable,
      id: variable.id ?? randomUUID(),
      // Ensure symbol is present for new schema
      // symbol:
      //   (variable as unknown as { symbol?: string }).symbol ??
      //   (typeof variable.name === "string"
      //     ? toPythonIdentifier(variable.name)
      //     : "var"),
      modelId: model.id,
    }));
    const constraintsWithModelId = milpModel.constraints.map((constraint) => ({
      ...constraint,
      id: constraint.id ?? randomUUID(),
      modelId: model.id,
    }));
    const objectiveWithModelId = {
      ...milpModel.objective,
      id: milpModel.objective.id ?? randomUUID(),
      modelId: model.id,
    };

    // Insert all components in parallel
    const results = await Promise.allSettled([
      setsWithModelId.length > 0
        ? tx.insert(s.set).values(setsWithModelId).returning()
        : Promise.resolve([]),
      parametersWithModelId.length > 0
        ? tx.insert(s.parameter).values(parametersWithModelId).returning()
        : Promise.resolve([]),
      variablesWithModelId.length > 0
        ? tx.insert(s.variable).values(variablesWithModelId).returning()
        : Promise.resolve([]),
      constraintsWithModelId.length > 0
        ? tx.insert(s.constraint).values(constraintsWithModelId).returning()
        : Promise.resolve([]),
      tx.insert(s.objective).values(objectiveWithModelId).returning(),
    ]);

    // Extract results
    const [
      setsResult,
      parametersResult,
      variablesResult,
      constraintsResult,
      objectivesResult,
    ] = results;

    const sets = setsResult.status === "fulfilled" ? setsResult.value : [];
    const parameters =
      parametersResult.status === "fulfilled" ? parametersResult.value : [];
    const variables =
      variablesResult.status === "fulfilled" ? variablesResult.value : [];
    const constraints =
      constraintsResult.status === "fulfilled" ? constraintsResult.value : [];
    const [objective] =
      objectivesResult.status === "fulfilled" ? objectivesResult.value : [null];

    return {
      model,
      sets,
      parameters,
      variables,
      constraints,
      objective,
    };
  });
}

// Batch delete operations
export async function deleteModelComponents(
  modelId: string,
  componentType:
    | "sets"
    | "parameters"
    | "variables"
    | "constraints"
    | "objectives"
) {
  switch (componentType) {
    case "sets":
      await db.delete(s.set).where(eq(s.set.modelId, modelId));
      break;
    case "parameters":
      await db.delete(s.parameter).where(eq(s.parameter.modelId, modelId));
      break;
    case "variables":
      await db.delete(s.variable).where(eq(s.variable.modelId, modelId));
      break;
    case "constraints":
      await db.delete(s.constraint).where(eq(s.constraint.modelId, modelId));
      break;
    case "objectives":
      await db.delete(s.objective).where(eq(s.objective.modelId, modelId));
      break;
  }
}

// Utility function to duplicate a model
export async function duplicateModel(
  originalModelId: string,
  userId: string,
  newModelData: Partial<s.ModelInserts>
) {
  const originalModel = await db.query.model.findFirst({
    where: (models, { eq }) => eq(models.id, originalModelId),
    with: {
      sets: true,
      parameters: true,
      variables: true,
      constraints: true,
      objectives: true,
    },
  });

  if (!originalModel) {
    throw new Error("Original model not found");
  }

  // Create new model data
  const modelData: s.ModelInserts = {
    ...originalModel,
    ...newModelData,
  };

  // Prepare component data without IDs and with new model reference
  const sets = originalModel.sets.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ id, modelId, createdAt, updatedAt, ...rest }) => rest
  );
  const parameters = originalModel.parameters.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ id, modelId, createdAt, updatedAt, ...rest }) => rest
  );
  const variables = originalModel.variables.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ id, modelId, createdAt, updatedAt, ...rest }) => rest
  );
  const constraints = originalModel.constraints.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ id, modelId, createdAt, updatedAt, ...rest }) => rest
  );
  const objective = originalModel.objectives[0]
    ? // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (({ id, modelId, createdAt, updatedAt, ...rest }) => rest)(
        originalModel.objectives[0]
      )
    : null;

  if (!objective) {
    throw new Error("Original model must have an objective");
  }

  return await createCompleteModel({
    metadata: modelData,
    sets: sets as s.SetInserts[],
    parameters: parameters as s.ParameterInserts[],
    variables: variables as s.VariableInserts[],
    constraints: constraints as s.ConstraintInserts[],
    objective: objective as s.ObjectiveInserts,
  });
}

// Helper functions for user-scoped operations
export async function verifyModelOwnership(modelId: string, userId: string) {
  const model = await db.query.model.findFirst({
    where: (models, { and, eq }) =>
      and(eq(models.id, modelId), eq(models.userId, userId)),
  });

  if (!model) {
    throw new Error("Model not found or access denied");
  }

  return model;
}

export async function createUserModel(
  userId: string,
  modelData: Omit<s.ModelInserts, "userId">
) {
  return await createModel({ ...modelData, userId });
}

export async function duplicateUserModel(
  originalModelId: string,
  userId: string,
  newModelData: Partial<Omit<s.ModelInserts, "userId">>
) {
  // Verify the user owns the original model
  await verifyModelOwnership(originalModelId, userId);

  return await duplicateModel(originalModelId, userId, {
    ...newModelData,
    userId,
  });
}
