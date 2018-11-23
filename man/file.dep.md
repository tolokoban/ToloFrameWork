# Dependency file

You can specify extra dependencies for the module `my-module.js` by adding a file `my-module.dep` in the same directory.
This file must be written in permissive JSON. Here is an example:

```js
{
    res: [explosion.mp3, bonus.mp3, victory.avi]
    js: { unity.min.js: libs/unity.js}
    var: {
      vert: "world.vert",
      frag: "world.frag"
    }
}
```

## res

Most of the time, if you need additional resources for module `my-module`, you can simply put them into `my-module/` directory. The directory content will be copied into `www/css/my-module/`.

But if you want to put resources in another directory, you can use the `res` attribute.
For instance, `[explosion.mp3]` (or `"explosion.mp3"`) means the compiler will copy `src/mod/explosion.mp3` to `www/explosion.mp3`. Moreover, `{ "explosion.mp3": "assets/explo.mp3" }` means the compiler will copy `src/mod/explosion.mp3` to `www/assets/explo.mp3`.

## js

You may need use of an external library.
Then the value `{ "unity.min.js": "libs/unity.js" }` means that the compiler must copy `src/mod/unity.min.js` to `www/libs/unity.js`.

## var

Add attributes in the `GLOBAL` variable of your module. The value of such variables is read from a file at compilation time.

In the example above, we will get the code for a vertex shader in `GLOBAL.vert` provided there is a file `world.vert` in the same directory as your module file.
