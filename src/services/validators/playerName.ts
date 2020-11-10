export const playerNameValidate = (playerName: string):string[] => {
  const messages: string[] = [];
  if (playerName.length < 3)
    messages.push("Le nom d'utilisateur doit comporter au moins 3 caractères");
  if (playerName.length > 15)
    messages.push(
      "Le nom d'utilisateur doit comporter moins de 16 caractères"
    );
    return messages;
};
