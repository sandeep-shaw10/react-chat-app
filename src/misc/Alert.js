import { Message, useToaster } from 'rsuite';


export function useAlert(){
    const toaster = useToaster()

    const generateAlert = (msg='unknown', type='info', placement='bottomEnd') => {
        const message = ( <Message showIcon type={type}>{msg}</Message> );
        return toaster.push(message, { placement })
    }

    return [generateAlert]
}

export const TYPE = {
    INFO: 'info',
    ERROR: 'error',
    SUCCESS: 'success',
    WARNING: 'warning'
}