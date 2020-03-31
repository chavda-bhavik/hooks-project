import { useReducer, useCallback } from 'react'

const initialState = { 
    loading: false, 
    error: null, 
    data: null, 
    reqExtra: null, 
    identifier: null 
}

const httpReducer = (httpState, action) => {
    switch (action.type) {
        case 'SEND':
            return { loading: true, error: null, data: null, reqExtra: null, identifier: action.identifier }
        case 'RESPONSE':
            return { ...httpState, loading: false, data: action.responseData, reqExtra: action.reqExtra}
        case 'ERROR':
            return { loading: false, error: action.error, ...httpState }
        case 'CLEAR':
            return initialState
        default:
            throw new Error("Should not get there!")
    }
}

const useHttp = () => {
    const [httpState, dispatchHttp] = useReducer(httpReducer, initialState);

    const clear = useCallback(() => dispatchHttp({ type: 'CLEAR' }), []);

    const sendRequest = useCallback((url, method, body, reqExtra, identifier) => {
        dispatchHttp({ type: 'SEND', identifier })
        fetch(url, { method, body, headers: { 'Content-Type': 'application/json' } })
        .then( response => response.json())
        .then( responseData => {
            dispatchHttp({ type: 'RESPONSE', responseData: responseData, reqExtra: reqExtra });
        })
        .catch( err => dispatchHttp({ type: 'ERROR', error: "Something went wrong!" }) )
    }, [])

    return {
        isLoading: httpState.loading,
        data: httpState.data,
        error: httpState.error,
        sendRequest: sendRequest,
        reqExtra: httpState.reqExtra,
        identifier: httpState.identifier,
        clear
    }
}

export default useHttp;