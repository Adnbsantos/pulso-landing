import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

function getAuth() {
  return new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: SCOPES,
  });
}

export async function getSheet(title: string = "UsuariosBackoffice") {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, getAuth());
  await doc.loadInfo();
  return doc.sheetsByTitle[title];
}