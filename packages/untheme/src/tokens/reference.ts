import type { UnthemeReference } from "../types"

export function manufactureReferenceTokenizer<RefToken extends string>(): UnthemeReference<RefToken> {
    return (tokens) => {
        const getReferenceTokens = () => tokens;
    
        const listReferenceTokens = () => Object.keys(tokens) as RefToken[];
    
        const resolveReferenceToken = (token: RefToken) => tokens[token];
    
        const editReferenceToken = (token: RefToken, value: string) => tokens[token] = value;
        
        return {
            getReferenceTokens,
            listReferenceTokens,
            resolveReferenceToken,
            editReferenceToken,
        }
    }
}
