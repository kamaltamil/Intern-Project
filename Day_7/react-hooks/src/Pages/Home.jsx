import React from 'react'
import {Button, Flex, Grid} from 'antd'
import Navbar from '../Components/Navbar'

const {useBreakpoint} = Grid;

const Home = () => {
    const screens = useBreakpoint();
    const isVertical = !screens.md;

  return (
    <>
        <Flex className='home-container' vertical>
            <Navbar />
            <Flex className='home-content' align='center' justify='center' gap='medium' vertical={isVertical}>
                <div className='home-content-text'>
                    <h3>NOW STREAMING • FANTASY ADVENTURE</h3>
                    <p>⭐ 8.6   •   2025   •   Fantasy • Adventure • Action</p>
                    <h1>AVATAR: THE LAST AIRBENDER</h1>
                    <p>
                        In a world where the four elements shape destiny, a young hero must master the powers of Air, Water, Earth, and Fire to restore balance. As powerful enemies rise, the journey becomes a test of courage, friendship, and hope.
                    </p>
                </div>
                <Flex className='home-content-buttons' gap={'small'}>
                    <Button type='primary' style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}>
                        Watch Now
                    </Button>
                    <Button style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                        + Add to Watchlist
                    </Button>
                </Flex>
            </Flex>
        </Flex>
    </>
  )
}

export default Home