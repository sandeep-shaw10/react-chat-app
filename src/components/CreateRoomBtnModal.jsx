import React, { useState, useCallback, useRef } from 'react';
import { Button, Modal, Form, Input, Schema } from 'rsuite'
import CreativeIcon from '@rsuite/icons/Creative';
import { useModalState } from '../misc/custom-hooks';
import FormGroup from 'rsuite/esm/FormGroup';
import FormControlLabel from 'rsuite/esm/FormControlLabel';
import FormControl from 'rsuite/esm/FormControl';
import { database, auth } from '../misc/firebase';
import { useAlert, TYPE } from '../misc/Alert';
import { ref, child, push, set, serverTimestamp } from 'firebase/database';


const { StringType } = Schema.Types;

const model = Schema.Model({
    name: StringType().isRequired('Chat Name is Required'),
    description: StringType().isRequired('Description is required'),
})

const INITIAL_FORM = {
    name: '',
    description: '',
};

  const Textarea = React.forwardRef((props, ref) => {
    return <Input {...props} as="textarea" ref={ref} />
});

const CreateRoomBtnModal = () => {

    const [formValue, setFormValue] = useState(INITIAL_FORM);
    const [isLoading, setIsLoading] = useState(false);
    const {isOpen, open, close} = useModalState()
    const [alert] = useAlert()
    const formRef = useRef();
  
    const onFormChange = useCallback(value => {
      setFormValue(value);
    }, []);

    const onSubmit = async () => {
        if (!formRef.current.check()) return
        setIsLoading(true);
    
        const newRoomdata = {
          ...formValue,
          createdAt: serverTimestamp(),
          admins: {
            [auth.currentUser.uid]: true,
          }
        };
    
        try {
            const roomId = push(child(ref(database), 'rooms')).key;
            await set(ref(database, `rooms/${roomId}`), newRoomdata);
          alert(`${formValue.name} has been created`);
          setIsLoading(false);
          setFormValue(INITIAL_FORM);
          close();
        } catch (err) {
          setIsLoading(false);
          alert(err.message, TYPE.ERROR);
        }
      };

    return <div className="mt-1">
        <Button block appearance='primary' color="green" onClick={open}>
            <CreativeIcon /> Create New Chat Room
        </Button>

        <Modal open={isOpen} onClose={close}>
            <Modal.Header>
                <Modal.Title>New Chat Room</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form fluid onChange={onFormChange} formValue={formValue} model={model} ref={formRef}>
                    <FormGroup>
                        <FormControlLabel>Room Name</FormControlLabel>
                        <FormControl name="name" placeholder='Enter Chat Room name'/>
                    </FormGroup>

                    <Form.Group>
                        <Form.ControlLabel>Description</Form.ControlLabel>
                        <Form.Control rows={5} name="description" placeholder='Enter Room Description' accepter={Textarea} />
                    </Form.Group>

                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button block appearance="primary" onClick={onSubmit} disabled={isLoading}>
                    Create New Chat Room
                </Button>
            </Modal.Footer>
        </Modal>
    </div>
}


export default CreateRoomBtnModal