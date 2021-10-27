import { getDocs, orderBy, query, QueryDocumentSnapshot, where } from "@firebase/firestore"
import React, { KeyboardEvent, useContext, useEffect, useState } from "react"
import { AuthContext } from "./App"
import {firestore, db} from './firebase'
import { Button, Card, CardActions, CardContent, Grid, IconButton, List, ListItem, ListItemText, Modal, Tab, Tabs, TextField, Typography } from "@mui/material"
import {Add as PlusIcon} from '@mui/icons-material'
import { Box } from "@mui/system"

type TextNote = {
  type: 'note'
  content: string
}

type ListNote = {
  type: 'list'
  items: string[]
}

export type Note = {
  type: string
  title: string
  createdAt: Date
  owner?: string
} & (TextNote | ListNote)

export function NoteList() {
  const auth = useContext(AuthContext)
  
  const [items,setItems] = useState<QueryDocumentSnapshot[]>([])
  const [error,setError] = useState<any>(undefined)
  useEffect(()=>{
    if (auth.user) {
      const q = query(firestore.collection(db,'items'),orderBy('createdAt'),where('owner','==',auth.user?.uid))
      getDocs(q).then((res)=>{
        setItems(res.docs)
      }).catch((err)=>{
        setError(err)
      })
    } else {
      setItems(JSON.parse(localStorage.getItem('savedItems') || "[]").map((item: any, i: number)=>{
        return {
          id: i + "",
          data() {
            return item
          }
        }
      }))
    }
  }, [auth.user])

  const [createModal, setCreateModalOpen] = useState(false)
  

  return (
    <>
      <Grid container spacing={2} sx={{marginTop: '50px', padding: '20px'}}>
        {error ? <Typography color="red">Error: {error?.message || 'Loading...'}</Typography>
        : items.map(item => {
            let data = item.data()
            return (
              <Grid item key={item.id} >
                <Card elevation={4} sx={{minWidth:"200px", maxWidth:"400px"}}>
                  <CardContent>
                    <Typography variant="h4">{data.title}</Typography>
                    {data.type === 'note' ? <Typography>{data.content}</Typography>
                    : <List>
                        {data.items.map((i: any, index: number)=><ListItem key={index}><ListItemText>{i}</ListItemText></ListItem>)}
                      </List>}
                  </CardContent>
                </Card>
              </Grid>
            )
          }).concat(
            <Grid item key={-1}>
              <Card elevation={4}>
                <CardContent>
                  <IconButton onClick={()=>setCreateModalOpen(true)}>
                    <PlusIcon fontSize="large" />
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          )
          
        }
      </Grid>
      <Modal open={createModal} onClose={()=>setCreateModalOpen(false)}>
        <div>
          <CreateNote onCloseRequest={()=>setCreateModalOpen(false)} />
        </div>
      </Modal>
    </>
  )
}

const CreateNote = (props: {onCloseRequest: ()=>void})=>{
  const auth = useContext(AuthContext)
  const [tab, setTab] = useState(0)
  const [title, setTitle] = useState("")
  const [noteValue, setNoteValue] = useState("")
  const [todo, setTodos] = useState<string[]>([])

  const create = async ()=>{
    let data: Note;
    if (tab === 0) {
      data = {
        type: 'note',
        title,
        createdAt: new Date(),
        content: noteValue
      }
      
    } else {
      data ={
        type: 'list',
        title,
        createdAt: new Date(),
        items: todo
      }
    }
    if (auth.user) {
      data.owner = auth.user.uid
      await firestore.addDoc(firestore.collection(db,'items'),data)
    } else {
      let saved = JSON.parse(localStorage.getItem('savedItems') || "[]")
      saved.push(data)
      localStorage.setItem('savedItems',JSON.stringify(saved))
    }
    props.onCloseRequest()
  }

  return (
    <Card sx={{maxWidth: '70vw', minWidth: '30vw', position: 'absolute', top: '30vh', left: '50%', transform: 'translate(-50%)'}}>
      <CardContent>
        <Typography variant="h4">Create a note</Typography>
        <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
          <Tabs value={tab} onChange={(e,val)=>setTab(val)}>
            <Tab label="Note" />
            <Tab label="List" />
          </Tabs>
        </Box>
        <TextField value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" sx={{marginTop: '15px'}} fullWidth />
        <TabPanels selected={tab}>
          <TextField value={noteValue} onChange={(e)=>setNoteValue(e.target.value)} multiline placeholder="Your text here" sx={{marginTop: '15px'}} fullWidth rows={5} />
          <CreateTodoList items={todo} onChange={setTodos} />
        </TabPanels>
      </CardContent>
      <CardActions>
        <Button variant="contained" color="primary" onClick={create}>Create</Button>
        <Button onClick={props.onCloseRequest}>Cancel</Button>
      </CardActions>
    </Card>
  )
}

const TabPanels: React.FC<{selected: number}> = (props) => {
  return Array.isArray(props.children) ? props.children[props.selected] : props.children
}

const CreateTodoList = (props: {items: string[], onChange: (items: string[])=>void})=>{
  const [newItem,setNewItem] = useState("")

  const addItem = (e: KeyboardEvent<any>)=>{
    if (e.key === 'Enter') {
      props.onChange([...props.items,newItem])
      setNewItem("")
    }
  }

  return (
    <>
      <List>
        {props.items.map((item,i) => (
          <ListItem key={i}>
            <ListItemText>{item}</ListItemText>
          </ListItem>
        ))}
      </List>
      <TextField value={newItem} placeholder="Add an Item..." inputProps={{onInput: (e)=>setNewItem(e.currentTarget.value), onKeyUp: addItem}} />
    </>
  )
}