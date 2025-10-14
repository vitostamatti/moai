import { db } from "./client";

// Model queries
export async function getModelWithComponents(modelId: string) {
  return await db.query.model.findFirst({
    where: (models, { eq }) => eq(models.id, modelId),
    with: {
      user: true,
      organization: true,
      sets: true,
      parameters: true,
      variables: true,
      constraints: true,
      objectives: true,
    },
  });
}

export async function getModelById(modelId: string) {
  return await db.query.model.findFirst({
    where: (models, { eq }) => eq(models.id, modelId),
    with: {
      user: true,
      organization: true,
    },
  });
}

export async function getAllModels() {
  return await db.query.model.findMany({
    with: {
      user: true,
      organization: true,
    },
    orderBy: (models, { desc }) => [desc(models.updatedAt)],
  });
}

export async function getModelsByUserId(userId: string) {
  return await db.query.model.findMany({
    where: (models, { eq }) => eq(models.userId, userId),
    with: {
      user: true,
      organization: true,
    },
    orderBy: (models, { desc }) => [desc(models.updatedAt)],
  });
}

// Organization-scoped listing
export async function getModelsByOrganizationId(organizationId: string) {
  return await db.query.model.findMany({
    where: (models, { eq }) => eq(models.organizationId, organizationId),
    with: {
      user: true,
      organization: true,
    },
    orderBy: (models, { desc }) => [desc(models.updatedAt)],
  });
}

export async function searchModels(searchTerm: string) {
  return await db.query.model.findMany({
    where: (models, { or, ilike }) =>
      or(
        ilike(models.name, `%${searchTerm}%`),
        ilike(models.description, `%${searchTerm}%`)
      ),
    with: {
      user: true,
      organization: true,
    },
    orderBy: (models, { desc }) => [desc(models.updatedAt)],
  });
}

export async function searchUserModels(userId: string, searchTerm: string) {
  return await db.query.model.findMany({
    where: (models, { and, eq, or, ilike }) =>
      and(
        eq(models.userId, userId),
        or(
          ilike(models.name, `%${searchTerm}%`),
          ilike(models.description, `%${searchTerm}%`)
        )
      ),
    with: {
      user: true,
      organization: true,
    },
    orderBy: (models, { desc }) => [desc(models.updatedAt)],
  });
}

// Organization-scoped search
export async function searchOrganizationModels(
  organizationId: string,
  searchTerm: string
) {
  return await db.query.model.findMany({
    where: (models, { and, eq, or, ilike }) =>
      and(
        eq(models.organizationId, organizationId),
        or(
          ilike(models.name, `%${searchTerm}%`),
          ilike(models.description, `%${searchTerm}%`)
        )
      ),
    with: {
      user: true,
      organization: true,
    },
    orderBy: (models, { desc }) => [desc(models.updatedAt)],
  });
}

// Set queries
export async function getSetsByModelId(modelId: string) {
  return await db.query.set.findMany({
    where: (sets, { eq }) => eq(sets.modelId, modelId),
    orderBy: (sets, { asc }) => [asc(sets.name)],
  });
}

export async function getSetById(setId: string) {
  return await db.query.set.findFirst({
    where: (sets, { eq }) => eq(sets.id, setId),
  });
}

// Parameter queries
export async function getParametersByModelId(modelId: string) {
  return await db.query.parameter.findMany({
    where: (parameters, { eq }) => eq(parameters.modelId, modelId),
    orderBy: (parameters, { asc }) => [asc(parameters.name)],
  });
}

export async function getParameterById(parameterId: string) {
  return await db.query.parameter.findFirst({
    where: (parameters, { eq }) => eq(parameters.id, parameterId),
  });
}

// Variable queries
export async function getVariablesByModelId(modelId: string) {
  return await db.query.variable.findMany({
    where: (variables, { eq }) => eq(variables.modelId, modelId),
    orderBy: (variables, { asc }) => [asc(variables.name)],
  });
}

export async function getVariableById(variableId: string) {
  return await db.query.variable.findFirst({
    where: (variables, { eq }) => eq(variables.id, variableId),
  });
}

// Constraint queries
export async function getConstraintsByModelId(modelId: string) {
  return await db.query.constraint.findMany({
    where: (constraints, { eq }) => eq(constraints.modelId, modelId),
    orderBy: (constraints, { asc }) => [asc(constraints.name)],
  });
}

export async function getConstraintById(constraintId: string) {
  return await db.query.constraint.findFirst({
    where: (constraints, { eq }) => eq(constraints.id, constraintId),
  });
}

// Objective queries
export async function getObjectivesByModelId(modelId: string) {
  return await db.query.objective.findMany({
    where: (objectives, { eq }) => eq(objectives.modelId, modelId),
    orderBy: (objectives, { asc }) => [asc(objectives.name)],
  });
}

export async function getObjectiveById(objectiveId: string) {
  return await db.query.objective.findFirst({
    where: (objectives, { eq }) => eq(objectives.id, objectiveId),
  });
}

// Combined queries for getting multiple components
export async function getModelSummary(modelId: string) {
  const model = await getModelById(modelId);
  if (!model) return null;

  const [sets, parameters, variables, constraints, objectives] =
    await Promise.all([
      getSetsByModelId(modelId),
      getParametersByModelId(modelId),
      getVariablesByModelId(modelId),
      getConstraintsByModelId(modelId),
      getObjectivesByModelId(modelId),
    ]);

  return {
    model,
    componentsCount: {
      sets: sets.length,
      parameters: parameters.length,
      variables: variables.length,
      constraints: constraints.length,
      objectives: objectives.length,
    },
  };
}

// User-specific query helpers
export async function getUserModelWithComponents(
  modelId: string,
  userId: string
) {
  const model = await db.query.model.findFirst({
    where: (model, { and, eq }) =>
      and(eq(model.id, modelId), eq(model.userId, userId)),
    with: {
      user: true,
      organization: true,
    },
  });

  if (!model) return null;

  const [sets, parameters, variables, constraints, objectives] =
    await Promise.all([
      getSetsByModelId(modelId),
      getParametersByModelId(modelId),
      getVariablesByModelId(modelId),
      getConstraintsByModelId(modelId),
      getObjectivesByModelId(modelId),
    ]);

  return {
    model,
    sets,
    parameters,
    variables,
    constraints,
    objectives,
  };
}

// Organization-scoped composite fetch
export async function getOrganizationModelWithComponents(
  modelId: string,
  organizationId: string
) {
  try {
    const model = await db.query.model.findFirst({
      where: (model, { and, eq }) =>
        and(eq(model.id, modelId), eq(model.organizationId, organizationId)),
      with: {
        user: true,
        organization: true,
      },
    });

    if (!model) {
      console.error("getOrganizationModelWithComponents: Model not found", {
        modelId,
        organizationId,
      });
      return null;
    }

    let sets, parameters, variables, constraints, objectives;
    try {
      [sets, parameters, variables, constraints, objectives] =
        await Promise.all([
          getSetsByModelId(modelId),
          getParametersByModelId(modelId),
          getVariablesByModelId(modelId),
          getConstraintsByModelId(modelId),
          getObjectivesByModelId(modelId),
        ]);
    } catch (subErr) {
      console.error(
        "getOrganizationModelWithComponents: Error in sub-queries",
        subErr
      );
      throw subErr;
    }

    return {
      model,
      sets,
      parameters,
      variables,
      constraints,
      objectives,
    };
  } catch (err) {
    console.error("getOrganizationModelWithComponents: Unexpected error", err);
    throw err;
  }
}

export async function getUserModelSummary(modelId: string, userId: string) {
  const model = await db.query.model.findFirst({
    where: (model, { and, eq }) =>
      and(eq(model.id, modelId), eq(model.userId, userId)),
    with: {
      user: true,
      organization: true,
    },
  });

  if (!model) return null;

  const [sets, parameters, variables, constraints, objectives] =
    await Promise.all([
      getSetsByModelId(modelId),
      getParametersByModelId(modelId),
      getVariablesByModelId(modelId),
      getConstraintsByModelId(modelId),
      getObjectivesByModelId(modelId),
    ]);

  return {
    model,
    componentsCount: {
      sets: sets.length,
      parameters: parameters.length,
      variables: variables.length,
      constraints: constraints.length,
      objectives: objectives.length,
    },
  };
}

export async function getOrganizationModelSummary(
  modelId: string,
  organizationId: string
) {
  const model = await db.query.model.findFirst({
    where: (model, { and, eq }) =>
      and(eq(model.id, modelId), eq(model.organizationId, organizationId)),
    with: {
      user: true,
      organization: true,
    },
  });

  if (!model) return null;

  const [sets, parameters, variables, constraints, objectives] =
    await Promise.all([
      getSetsByModelId(modelId),
      getParametersByModelId(modelId),
      getVariablesByModelId(modelId),
      getConstraintsByModelId(modelId),
      getObjectivesByModelId(modelId),
    ]);

  return {
    model,
    componentsCount: {
      sets: sets.length,
      parameters: parameters.length,
      variables: variables.length,
      constraints: constraints.length,
      objectives: objectives.length,
    },
  };
}

// Chat helpers
export async function getChatById(chatId: string) {
  if (!chatId) {
    // Guard against accidental empty/undefined ids which would produce a broken SQL
    // binding (observed as params: 1,,1). Return null to indicate not found.
    console.warn("getChatById called with empty chatId", chatId);
    return null;
  }

  return await db.query.chat.findFirst({
    where: (chat, { eq }) => eq(chat.id, chatId),
    with: { user: true, messages: true },
  });
}

export async function listChatsForUser(userId: string) {
  return await db.query.chat.findMany({
    where: (chat, { eq }) => eq(chat.userId, userId),
    orderBy: (chat, { desc }) => [desc(chat.createdAt)],
  });
}

export async function listChatsForOrganization(organizationId: string) {
  return await db.query.chat.findMany({
    where: (chat, { eq }) => eq(chat.organizationId, organizationId),
    orderBy: (chat, { desc }) => [desc(chat.createdAt)],
  });
}

export async function getMessagesByChatId(chatId: string) {
  if (!chatId) {
    console.warn("getMessagesByChatId called with empty chatId", chatId);
    return [];
  }

  return await db.query.message.findMany({
    where: (message, { eq }) => eq(message.chatId, chatId),
    orderBy: (message, { asc }) => [asc(message.createdAt)],
  });
}
