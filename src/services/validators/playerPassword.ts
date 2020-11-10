export const passwordValidate = (password: string):string[] => {
  const messages: string[] = [];
  const regex = /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/;
  if (password.length < 3)
    messages.push("Le mot de passe doit comporter au moins 3 caractères");
  if (!regex.test(password))
    messages.push(
      "Le mot de passe doit contenir au moins contenir un chiffre et une lettre"
    );
    return messages;
};
