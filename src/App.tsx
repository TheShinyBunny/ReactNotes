import React, { useContext, useRef, useState } from 'react';
import './App.css';
import {AppBar, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography} from '@mui/material'
import {NoteAlt as NoteIcon, LoginTwoTone as LoginIcon, AccountCircle as AccountIcon} from '@mui/icons-material'
import { LoginModal } from './Account';
import { User } from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth';
import { authInstance, auth as fbAuth } from './firebase';
import { NoteList } from './NoteList';

export const AuthContext = React.createContext<{user?: User}>({user: undefined})

function App() {
  const [user] = useAuthState(authInstance)
  return (
    <div className="App">
      <AuthContext.Provider value={{user}}>
        <Header />
        <NoteList />
      </AuthContext.Provider>
    </div>
  );
}

function Header() {
  const auth = useContext(AuthContext)
  const [menuOpen,setMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const accountMenuButton = useRef(null)

  const logout = ()=>{
    fbAuth.signOut(authInstance)
  }

  return (
    <>
      <AppBar position="relative">
        <Toolbar>
          <NoteIcon fontSize="large" />
          <Typography sx={{flexGrow: 1, textAlign: 'start'}} variant="h3" component="span">React<Typography component="span" variant="h3" color="red">Notes</Typography></Typography>
          
          {auth.user
          ? <>
              <IconButton onClick={()=>setMenuOpen(!menuOpen)} ref={accountMenuButton}>
                <AccountIcon fontSize="large" />
              </IconButton>
              <Menu open={menuOpen} onClose={()=>setMenuOpen(false)} anchorEl={accountMenuButton.current}>
                <MenuItem disabled>Hello, {auth.user.displayName || auth.user.email}</MenuItem>
                <MenuItem onClick={logout}>Log Out</MenuItem>
              </Menu>
            </>
          : <Tooltip title="Login">
              <IconButton onClick={()=>setLoginOpen(true)}>
                  <LoginIcon sx={{color: 'white'}} fontSize="large" />
                </IconButton>
            </Tooltip>
          }
        </Toolbar>
      </AppBar>
      <LoginModal open={loginOpen} onClose={()=>setLoginOpen(false)} />
    </>
  )
}

export default App;
