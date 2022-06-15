import React from 'react'
import { Navigate } from 'react-router-dom'
import { Container, Loader } from 'rsuite'
import { useProfile } from '../context/profile'


function PublicRoute({ render, fallback = "/" }) {
    const { profile, isLoading } = useProfile()

    if(isLoading && !profile){
        return <Container>
            <Loader center vertical size="md" content="Loading..." speed="slow" />
        </Container>
    }

    if(profile && !isLoading){
        return <Navigate to={fallback} replace={true} />
    }

    return render

}

export default PublicRoute