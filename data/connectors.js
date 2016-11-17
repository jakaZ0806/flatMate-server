/**
 * Created by Lukas on 16-Nov-16.
 */
var users = [{id: 0, firstName: "Test", lastName: "User"}];
var id = 1;

function addUser(firstName, lastName) {
    console.log("Adding " + firstName + " " + lastName);
    return new Promise(resolve => {
        setTimeout(() => {
            let u = {
                id: id++,
                firstName,
                lastName
            };
            users.push(u);
            resolve(u);
        }, 1);
    });
}
function getUsers() {
    return users;
}




export {
    getUsers,
    addUser

}