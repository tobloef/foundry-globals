const wrapper = async (func) => {
  try {
    await func();
  } catch (error) {
    ui.notifications.error("An error occured during macro execution.");
    throw error;
  }
};

const getActorAsync = async () => {
  let ownActor = game.user.character;
  let tokenActor = (canvas.tokens.controlled[0] || {}).actor;
  let actorToUse = ownActor || tokenActor;

  if (canvas.tokens.controlled.length > 1) {
    ui.notifications.error("Multiple token selected. Please select just one token and try again.");
    throw new Error("Multiple actors selected.");
  }

  if (
    (ownActor != null) && 
    (tokenActor != null) &&
    (ownActor.id !== tokenActor.id)
  ) {
    actorToUse = await showActorChoicePrompt(ownActor, tokenActor);
  }

  if (actorToUse == null) {
    ui.notifications.error("No actor found. Perhaps select its token?");
    throw new Error("No actor found.");
  }

  return actorToUse;
};

const showActorChoicePrompt = async (ownActor, tokenActor) => {
  return new Promise((resolve, reject) => {
    (new Dialog({
     title: "Multiple potential actors",
     content: "Which actor would you like to use?",
     buttons: {
      owned: {
       label: `My own actor (${ownActor.name})`,
       callback: () => resolve(ownActor),
      },
      selected: {
       label: `The selected one (${tokenActor.name})`,
       callback: () => resolve(tokenActor),
      },
     },
     default: "owned",
    })).render(true);
  });
};

const findEffect = (actorToUse, name) => {
  const effects = actorToUse.effects.entries;
  for (let i = 0; i < effects.length; i++){
    if (effects[i].data.label === name) {
      return effects[i];
    }
  }
};

const setEffectStateAsync = async (actorToUse, effect, state) => {
  await actorToUse.updateEmbeddedEntity("ActiveEffect", {
    "_id": effect.data._id,
    "disabled" : !state
  });
};

const toggleEffectAsync = async (actorToUse, effect) => {
  await setEffectState(actorToUse, effect, !effect.data.disabled);
};