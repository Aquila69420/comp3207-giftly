import React, { useState } from 'react';
import TextInput from './components/TextInput';
import ImageInput from './components/ImageInput';
import DropdownSelection from './components/DropdownSelection';
import UserLoginRegister from './components/UserLoginRegister';
import WishList from './components/WishList';
import FindUsers from './components/FindUsers';
import Cart from './components/Cart';

function Home() {
  const [username, setUsername] = useState('');
  return (
    <div>
      <header className="App-header">
        <p style={{
            fontSize: '36px', // Larger font size
            fontWeight: 'bold', // Bold text
            marginBottom: '100px', // Space below the title
          }}>Gifto</p>
        <TextInput username={username}/>
        <ImageInput username={username}/>
        <DropdownSelection username={username}/>
        <UserLoginRegister setUsername={setUsername}/>
        <WishList username={username}/>
        <FindUsers/>
        <Cart username={username}/>
      </header>
    </div>
  );
}

export default Home;
