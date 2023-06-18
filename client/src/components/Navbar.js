import React, {useContext} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {UserContext} from '../App'
const NavBar = ()=> {
    const {state, dispatch} = useContext(UserContext)
    const navigate = useNavigate()
    const renderList = () => {
      if(state){
        return [
          <li key="profile"><Link to="/profile">Profile</Link></li>,
          <li key="create"><Link to="/create">Create Post</Link></li>,
          <li key="myfollowingpost"><Link to="/myfollowingpost">My Following Posts</Link></li>,
          <li key="logout">
            <button className="btn #c62828 red darken-3"
                onClick={() => {
                  localStorage.clear()
                  dispatch({type:"CLEAR"})
                  navigate('/signin')
                } }
            >
              Logout
            </button>
          </li>
        ]
      } else {
          return [
            <li key="signin"><Link to="/signin">Sign in</Link></li>,
            <li key="signup"><Link to="/signup">Sign up</Link></li>
          ]
      }
    }
    return(
    <nav>
    <div className="nav-wrapper white">
      <Link to={state?"/":"/signin"} className="brand-logo left">Instagram</Link>
      <ul id="nav-mobile" className="right">
        {renderList()}
      </ul>
    </div>
    </nav>
    )    
}

export default NavBar