import { UnthemeSystem } from "../types"

export function manufactureSystemTokenizer<SysToken extends string, RefToken extends string>(): UnthemeSystem<SysToken, RefToken> {
    return (tokens) => {
        const getSystemTokens = () => tokens;

        const listSystemTokens = () => Object.keys(tokens) as SysToken[];

        const resolveSystemToken = (token: SysToken) => tokens[token];

        const editSystemToken = (token: SysToken, value: RefToken) => tokens[token] = value;
        
        return {
            getSystemTokens,
            listSystemTokens,
            resolveSystemToken,
            editSystemToken
        }
    }
}