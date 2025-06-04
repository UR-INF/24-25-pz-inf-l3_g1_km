export const validateNip = (nip) => {
  const cleanNip = nip.replace(/[^0-9]/g, "");
  if (cleanNip.length !== 10) {
    return "NIP musi składać się z 10 cyfr.";
  }
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanNip.charAt(i)) * weights[i];
  }
  const checkDigit = sum % 11;
  if (checkDigit === 10 || checkDigit !== parseInt(cleanNip.charAt(9))) {
    return "Nieprawidłowy NIP.";
  }
  return "";
};
