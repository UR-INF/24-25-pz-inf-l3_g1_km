export interface CompanyData {
  companyName: string;
  companyStreet: string;
  companyBuildingNo: string;
  companyPostalCode: string;
  companyCity: string;
  companyCountry: string;
}

interface ApiResponse {
  result?: {
    subject?: {
      name?: string;
      workingAddress?: string | null;
      residenceAddress?: string | null;
    };
  };
}

export const fetchCompanyByNip = async (nip: string): Promise<CompanyData> => {
  const cleanNip = nip.replace(/[^0-9]/g, "");
  const date = new Date().toISOString().split("T")[0];
  const url = `https://wl-api.mf.gov.pl/api/search/nip/${cleanNip}?date=${date}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Nieprawidłowa odpowiedź z API");
    }

    const data: ApiResponse = await response.json();
    const subject = data.result?.subject;

    // console.log(subject);

    if (!subject?.name) {
      throw new Error("Brak nazwy firmy w odpowiedzi z API");
    }

    const rawAddress = subject.workingAddress || subject.residenceAddress || "";

    const [addressPart, postalCityPart] = rawAddress.split(",").map((s) => s.trim());

    const addressTokens = addressPart?.split(" ") ?? [];
    const street = addressTokens.slice(0, -1).join(" ");
    const buildingNo = addressTokens.at(-1) ?? "";

    const postalMatch = postalCityPart?.match(/\d{2}-\d{3}/);
    const postalCode = postalMatch?.[0] ?? "";
    const city = postalCode
      ? postalCityPart?.replace(postalCode, "").trim()
      : postalCityPart?.trim();

    return {
      companyName: subject.name,
      companyStreet: street || "",
      companyBuildingNo: buildingNo || "",
      companyPostalCode: postalCode || "",
      companyCity: city || "",
      companyCountry: "Polska",
    };
  } catch (error) {
    console.error("Błąd przy pobieraniu danych firmy:", error);
    throw error;
  }
};
