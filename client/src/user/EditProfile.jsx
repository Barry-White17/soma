import React, { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Icon from '@mui/material/Icon'
import Avatar from '@mui/material/Avatar'
import FileUpload from '@mui/icons-material/AddPhotoAlternate'
import { makeStyles } from 'tss-react/mui'
import auth from '../auth/auth-helper.js'
import { read, update } from './api-user.js'
import { Navigate } from 'react-router-dom'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useParams } from 'react-router-dom'
import config from './../../config.js'

const useStyles = makeStyles()((theme) => ({
    card: {
        maxWidth: 600,
        margin: 'auto',
        textAlign: 'center',
        marginTop: theme.spacing(5),
        paddingBottom: theme.spacing(2),
    },
    title: {
        margin: theme.spacing(2),
        color: theme.palette.protectedTitle,
    },
    error: {
        verticalAlign: 'middle',
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 300,
    },
    submit: {
        margin: 'auto',
        marginBottom: theme.spacing(2),
    },
    bigAvatar: {
        width: 60,
        height: 60,
        margin: 'auto',
    },
    input: {
        display: 'none',
    },
    filename: {
        marginLeft: '10px',
    },
}))

export default function EditProfile({ match }) {
    const { classes } = useStyles()
    const [values, setValues] = useState({
        name: '',
        about: '',
        photo: '',
        email: '',
        password: '',
        redirectToProfile: false,
        error: '',
        id: '',
    })
    const { userId } = useParams()
    const jwt = auth.isAuthenticated()
    const [showPassword, setShowPassword] = useState(false)
    const handlePassword = () => {
        setShowPassword(!showPassword)
    }
    useEffect(() => {
        const abortController = new AbortController()
        const signal = abortController.signal

        read(
            {
                userId: userId,
            },
            { t: jwt.token },
            signal,
        ).then((data) => {
            if (data & data.error) {
                setValues({ ...values, error: data.error })
            } else {
                setValues({
                    ...values,
                    id: data._id,
                    name: data.name,
                    email: data.email,
                    about: data.about,
                })
            }
        })
        return function cleanup() {
            abortController.abort()
        }
    }, [userId])

    const clickSubmit = () => {
        let userData = new FormData()
        values.name && userData.append('name', values.name)
        values.email && userData.append('email', values.email)
        values.password && userData.append('password', values.password)
        values.about && userData.append('about', values.about)
        values.photo && userData.append('photo', values.photo)
        update(
            {
                userId: userId,
            },
            {
                t: jwt.token,
            },
            userData,
        ).then((data) => {
            if (data && data.error) {
                setValues({ ...values, error: data.error })
            } else {
                setValues({ ...values, redirectToProfile: true })
            }
        })
    }
    const handleChange = (name) => (event) => {
        const value =
            name === 'photo' ? event.target.files[0] : event.target.value
        //userData.set(name, value)
        setValues({ ...values, [name]: value })
    }
    const photoUrl = values.id
        ? `${config.BACKEND_URL}/api/users/photo/${
              values.id
          }?${new Date().getTime()}`
        : jwt.user.name[0]
    if (values.redirectToProfile) {
        return <Navigate to={'/user/' + values.id} />
    }
    return (
        <Card className={classes.card}>
            <CardContent>
                <Typography variant='h6' className={classes.title}>
                    Edit Profile
                </Typography>
                <Avatar src={photoUrl} className={classes.bigAvatar} />
                <br />
                <input
                    accept='image/*'
                    onChange={handleChange('photo')}
                    className={classes.input}
                    id='icon-button-file'
                    type='file'
                />
                <label htmlFor='icon-button-file'>
                    <Button
                        variant='contained'
                        color='primary'
                        component='span'
                    >
                        Upload
                        <FileUpload />
                    </Button>
                </label>{' '}
                <span className={classes.filename}>
                    {values.photo ? values.photo.name : ''}
                </span>
                <br />
                <TextField
                    id='name'
                    label='Name'
                    className={classes.textField}
                    value={values.name}
                    onChange={handleChange('name')}
                    margin='normal'
                />
                <br />
                <TextField
                    id='multiline-flexible'
                    label='About'
                    multiline
                    rows='2'
                    value={values.about}
                    onChange={handleChange('about')}
                    className={classes.textField}
                    margin='normal'
                />
                <br />
                <TextField
                    id='email'
                    type='email'
                    label='Email'
                    className={classes.textField}
                    value={values.email}
                    onChange={handleChange('email')}
                    margin='normal'
                />
                <br />
                <TextField
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    label='Password'
                    className={classes.textField}
                    value={values.password}
                    onChange={handleChange('password')}
                    margin='normal'
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position='end'>
                                <IconButton onClick={handlePassword}>
                                    {showPassword ? (
                                        <Visibility />
                                    ) : (
                                        <VisibilityOff />
                                    )}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <br />{' '}
                {values.error && (
                    <Typography component='p' color='error'>
                        <Icon color='error' className={classes.error}>
                            error
                        </Icon>
                        {values.error}
                    </Typography>
                )}
            </CardContent>
            <CardActions>
                <Button
                    color='primary'
                    variant='contained'
                    onClick={clickSubmit}
                    className={classes.submit}
                >
                    Submit
                </Button>
            </CardActions>
        </Card>
    )
}
