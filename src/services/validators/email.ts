export const emailValidate = (email: string):string[] => {
    const messages: string[] = [];
   if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
        messages.push("adresse email invalide.");
      }
      return messages;
  };
  