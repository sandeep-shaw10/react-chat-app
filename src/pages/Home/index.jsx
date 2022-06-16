import React from 'react';
import { Grid, Row, Col } from 'rsuite';
import Sidebar from '../../components/Sidebar';
import { RoomsProvider } from '../../context/rooms';
import { useLocation, Outlet } from "react-router-dom";
import { useMediaQuery } from '../../misc/custom-hooks';


const Home = () => {

    const isDesktop = useMediaQuery('(min-width: 992px)');
    const location = useLocation()
    const isExact = location.pathname === '/'
    const canRenderSidebar = isDesktop || isExact

  return (
    <RoomsProvider>
      <Grid fluid className="h-100">
        <Row className="h-100">

          {canRenderSidebar && (
            <Col xs={24} md={8} className="h-100">
              <Sidebar />
            </Col>
          )}

            <Col xs={24} md={16} className="h-100">
                <Outlet/>
            </Col>

        </Row>
      </Grid>
    </RoomsProvider>
  );
};

export default Home;