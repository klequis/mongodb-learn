import React from 'react';

// import logo from './logo.svg';
// import './App.css';
import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/styles/hljs'
const {MongoClient, ObjectID} = require('mongodb')

// const codeString = '(num) => num + 1';
const code = {a:1, 'b':'foo', c:[false,'false',null, 'null', {d:{e:1.3e5,f:'1.3e5'}}]}

const json = JSON.stringify(code, undefined, 2)

// MongoClient.connect('mongodb://localhost:27017/guide', (err, client) => {
//   if (err) {
//     return console.log('Unable to connect MongoDB server')
//   }
//   console.log('Connected to MongoDB server')
//   const db = client.db('TodoApp')
//
//
//   client.close()
// })


const App = () => {


  return <SyntaxHighlighter language='javascript' style={docco}>{json}</SyntaxHighlighter>;

}

export default App;
