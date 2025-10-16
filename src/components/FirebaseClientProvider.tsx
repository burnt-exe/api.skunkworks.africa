"use client";
import { ReactNode, createContext, useContext } from "react";
import { app, db, auth, storage } from "@/firebase";

interface FirebaseContextType {
  app: typeof app;
  db: typeof db;
  auth: typeof auth;
  storage: typeof storage;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseContext.Provider value={{ app, db, auth, storage }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const ctx = useContext(FirebaseContext);
  if (!ctx) throw new Error("useFirebase must be used within FirebaseClientProvider");
  return ctx;
}
