import { costaPackages } from "@/data/packages";

export type PackageKey = keyof typeof costaPackages;

export function getPackage(packageKey: PackageKey) {
  return costaPackages[packageKey];
}

export function getAllPackages() {
  return Object.entries(costaPackages).map(([key, value]) => ({
    key,
    ...value,
  }));
}