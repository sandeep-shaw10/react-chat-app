import React, { memo } from 'react';
import { Button, Drawer, Input } from 'rsuite';
import { useParams } from 'react-router';
import { useModalState, useMediaQuery } from '../../../misc/custom-hooks';
import EditableInput from '../../EditableInput';
import { useCurrentRoom } from '../../../context/current-room';
import { database } from '../../../misc/firebase';
import { useAlert, TYPE } from '../../../misc/Alert';
import { set, ref } from 'firebase/database';


const Textarea = React.forwardRef((props, ref) => {
    return <Input {...props} as="textarea" ref={ref} />
});


const EditRoomBtnDrawer = () => {
  const { isOpen, open, close } = useModalState();
  const { chatId } = useParams();
  const isMobile = useMediaQuery('(max-width: 992px)');
  const [alert] = useAlert()

  const name = useCurrentRoom(v => v.name);
  const description = useCurrentRoom(v => v.description);

  const updateData = (key, value) => {
    const dbRef = ref(database, `rooms/${chatId}/${key}`)
    set(dbRef, value).then(() => {
        alert('Successfully updated', TYPE.SUCCESS);
      })
      .catch(err => {
        alert(err.message, TYPE.ERROR);
      });
  };

  const onNameSave = newName => {
    updateData('name', newName);
  };

  const onDescriptionSave = newDesc => {
    updateData('description', newDesc);
  };

  return (
    <div>
      <Button className="br-circle" size="sm" color="red" appearance='primary' onClick={open}>
        A
      </Button>

      <Drawer full={isMobile} open={isOpen} onClose={close} placement="right">
        <Drawer.Header>
          <Drawer.Title>Edit Room</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <EditableInput
            initialValue={name}
            onSave={onNameSave}
            label={<h6 className="mb-2">Name</h6>}
            emptyMsg="Name can not be empty"
          />
          <EditableInput
            as="textarea"
            rows={5}
            label={<h6 className="mb-2">Description</h6>}
            initialValue={description}
            onSave={onDescriptionSave}
            emptyMsg="Description can not be empty"
            wrapperClassName="mt-3"
          />
        </Drawer.Body>
      </Drawer>
    </div>
  );
};

export default memo(EditRoomBtnDrawer);