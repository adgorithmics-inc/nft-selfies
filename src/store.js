import create from 'zustand';
import { persist } from "zustand/middleware";

export const useStore = create(persist(
    (set, get) => ({
        view: "login",
        apiKey: null,
        contract: null,
        series: null,
        buttonsDisabled: false,
        enableButtons: () => set({ buttonsDisabled: false }),
        disableButtons: () => set({ buttonsDisabled: true }),
        setContract: (contract => set({ contract })),
        setSeries: (series => set({ series })),
        setApiKey: (apiKey) => set({ apiKey }),
        setView: (view) => set({ view })
    }),
    {
        name: "nft-creator-2"
    }
));
