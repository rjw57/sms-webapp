### Examples

```js
const ShowProfile = withProfile(({ profile }) => (
  <div>Your profile is: { JSON.stringify(profile) }</div>
));

<ProfileProvider>
  <ShowProfile />
</ProfileProvider>
```
