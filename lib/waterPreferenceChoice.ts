export type WaterPreferenceChoice =
  | "none"
  | "daily"
  | "unlimited";

type WaterPreferenceState = {
  bottledWaterDailyAllowance: boolean;
  bottledWaterUnlimited: boolean;
};

export function resolveWaterPreferenceChoice(
  state: WaterPreferenceState
): WaterPreferenceChoice {
  if (state.bottledWaterUnlimited) {
    return "unlimited";
  }

  if (state.bottledWaterDailyAllowance) {
    return "daily";
  }

  return "none";
}

export function resolveWaterPreferenceState(
  choice: WaterPreferenceChoice
): WaterPreferenceState {
  if (choice === "unlimited") {
    return {
      bottledWaterDailyAllowance: true,
      bottledWaterUnlimited: true,
    };
  }

  if (choice === "daily") {
    return {
      bottledWaterDailyAllowance: true,
      bottledWaterUnlimited: false,
    };
  }

  return {
    bottledWaterDailyAllowance: false,
    bottledWaterUnlimited: false,
  };
}

