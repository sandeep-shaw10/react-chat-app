import React from 'react';
import { useMediaQuery } from '../../misc/custom-hooks';
import { Col } from 'rsuite';



const HomeOutlet = () => {

    const isDesktop = useMediaQuery('(min-width: 992px)');
    
  return <>
    {isDesktop && (
        <Col xs={24} md={16} className="h-100">
            <h6 className="text-center mt-page">Please select chat</h6>
        </Col>
    )}
  </>
};

export default HomeOutlet;