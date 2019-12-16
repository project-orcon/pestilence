# pestilence

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn run serve
```

### Compiles and minifies for production
```
yarn run build
```

#### Use Camera Component
Camera component asks for user permissions to display inline camera for taking pictures, if not granted or if camera doesn't exist a file picker is displayed. 

 ``` 
 <Camera v-model="files" :rules="imageRules"></Camera>
 ```
 
 - files array contains image file (single file for moment), 
 - imageRules is an array of functions that return error strings used to validate that image exists.  

Camera component is adjusted to full screen using the following css, change to suit page. 
```
 .camera_on {
margin: 0 -24px !important;
}
```


