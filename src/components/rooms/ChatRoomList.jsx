import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav, Loader } from 'rsuite';
import RoomItem from './RoomItem';
import { useRooms } from '../../context/rooms'


const MyLink = React.forwardRef((props, ref) => {
  const { href, as, ...rest } = props;
  return (
    <Link to={href} as={as}>
      <a ref={ref} {...rest} />
    </Link>
  );
});


const ChatRoomList = ({ aboveElHeight }) => {

  const rooms = useRooms();
  const location = useLocation();
  

  return (
    <Nav
      appearance="subtle"
      vertical
      reversed
      className="overflow-y-scroll custom-scroll"
      style={{
        height: `calc(100% - ${aboveElHeight}px)`,
      }}
      activekey={location.pathname}
    >
      {!rooms && (
        <Loader center vertical content="Loading" speed="slow" size="md" />
      )}
      {rooms &&
        rooms.length > 0 &&
        rooms.map(room => 
          <Nav.Item key={room.id} to={`/chat/${room.id}`} as={Link}>
            <RoomItem room={room} />
          </Nav.Item>
        )}
    </Nav>
  );
};

export default ChatRoomList;