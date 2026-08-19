import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const REPORTER_ID_KEY = "@aguapr/reporter-id";

export async function getReporterId(): Promise<string> {
  let reporterId = await AsyncStorage.getItem(REPORTER_ID_KEY);

  if (!reporterId) {
    reporterId = Crypto.randomUUID();
    await AsyncStorage.setItem(REPORTER_ID_KEY, reporterId);
  }

  return reporterId;
}
