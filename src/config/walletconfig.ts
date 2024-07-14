import { http, createConfig } from 'wagmi'
import { mainnet, sepolia,
    polygonAmoy,
    scrollSepolia,
    arbitrumSepolia,
    rootstockTestnet,
    neonDevnet,
    baseSepolia,
    auroraTestnet,
} from 'wagmi/chains'

export const config = createConfig({
    chains: [mainnet, sepolia,
        polygonAmoy,
        scrollSepolia,
        arbitrumSepolia,
        rootstockTestnet,
        neonDevnet,
        baseSepolia,
        auroraTestnet,
    ],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [polygonAmoy.id]: http(),
        [scrollSepolia.id]: http(),
        [arbitrumSepolia.id]: http(),
        [rootstockTestnet.id]: http(),
        [neonDevnet.id]: http(),
        [baseSepolia.id]: http(),
        [auroraTestnet.id]: http(),
    },
})