
import { Google as GoogleIcon } from '@mui/icons-material'
import { Modal, Box, Button, TextField, Link } from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {auth, authInstance} from './firebase'

export function LoginModal(props: {open: boolean, onClose: ()=>void}) {
  const {register, handleSubmit, formState} = useForm()
  const [registering,setRegister] = useState(false)

  const authenticate = async (data: any)=>{
    console.log('authenticating')
    let res;
    if (registering) {
      res = await auth.createUserWithEmailAndPassword(authInstance,data.email,data.password)
    } else {
      res = await auth.signInWithEmailAndPassword(authInstance,data.email,data.password)
    }

    if (res) {
      console.log('Logged in:',res)
      props.onClose()
    }
  }

  const signInWithGoogle = async ()=>{
    const provider = new auth.GoogleAuthProvider()
    const res = await auth.signInWithPopup(authInstance,provider).catch(()=>{})

    if (res) {
      console.log('Logged in:',res)
      props.onClose()
    }
  }

  return <Modal open={props.open} onClose={props.onClose}>
    <Box sx={{width: 400, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', padding: '10px'}}>
      <Button variant="outlined" startIcon={<GoogleIcon />} onClick={signInWithGoogle}>Sign In With Google</Button>
      <form>
        <TextField margin="normal" {...register('email',{required: true})} error={!!formState.errors.email} helperText={formState.errors.email && 'Invalid email'} label="Email" variant="outlined"/>
        <TextField margin="normal" {...register('password',{required: true})} error={!!formState.errors.password} helperText={formState.errors.password && 'Password is required'} label="Password" type="password" variant="outlined"/>
        {registering && <TextField margin="normal" {...register('confirm_password',{validate: (val)=>val !== formState.touchedFields.password})} error={!!formState.errors.confirm_password} helperText={formState.errors.confirm_password && 'Passwords do not match!'} label="Confirm Password" type="password" variant="outlined" />}
      </form>
      <Button onClick={handleSubmit(authenticate)} variant="contained" color="primary">{registering ? "Register" : "Log In"}</Button>
      <br/>
      {!registering && <>New around here? <Link sx={{cursor: 'pointer'}} onClick={()=>setRegister(true)}>Register</Link></>}
    </Box>
  </Modal>
}
