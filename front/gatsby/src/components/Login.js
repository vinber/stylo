import React, {useState} from "react"
import { Link, navigate } from "gatsby"
import { connect } from "react-redux"

import etv from '../helpers/eventTargetValue'
import askGraphQL from '../helpers/graphQL';
import validateEmail from '../helpers/validationEmail'

import styles from './login.module.scss'

const mapStateToProps = ({ logedIn }) => {
    return { logedIn }
}

const ConnectedLogin = (props) => {
    if(props.logedIn){
        navigate('/articles')
    }

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const query = "query($email:String,$username:String,$password:String!){login(username:$username,email:$email,password:$password){token token_cookie password{_id username}users{_id displayName}}}"
    let user = {email, password}

    const loginUser = async (query,user) => {
        //Validate stuff client-side
        if(user.email == ""){
            alert('Email/username is empty')
            return false
        }
        if(user.password == ""){
            alert('password is empty')
            return false
        }
        if(!validateEmail(user.email)){
            user.username = user.email
            delete user.email
        }


        try{
            console.log(await askGraphQL({query,variables:user}))
            //if no error thrown, we can navigate to /login
            
        }
        catch(err){
            console.log("failed")
        }
    }

    return (
        <section className={styles.box}>
            <form onSubmit={(event)=>{event.preventDefault();loginUser(query,user)}}>
                <h1>Login</h1>
                <input type="text" placeholder="email or username" value={email} onChange={(e)=>setEmail(etv(e))}/>
                <input type="password" placeholder="password" value={password} onChange={(e)=>setPassword(etv(e))}/>
                <input type="submit" value="go"/>
                <p className="note">or <Link to="/register">create an account</Link></p>
            </form>
        </section> 
    )
}

const Login = connect(
    mapStateToProps
)(ConnectedLogin)
export default Login