import React from 'react'
import { Row, Col, Grid } from 'rsuite'
import Sidebar from '../components/Sidebar'
import { RoomsProvider } from '../context/rooms';


export default function Home() {
  return <RoomsProvider>
    <Grid fluid className="h-100">
      <Row className='h-100'>
        <Col xs={24} md={8} className='h-100'>
          <Sidebar />
        </Col>
      </Row>
    </Grid>
  </RoomsProvider>
}
