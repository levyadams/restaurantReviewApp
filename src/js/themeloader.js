
window.addEventListener('DOMContentLoaded', () => {
    CreateNavBar();
    ResizeWindow();
});
window.addEventListener('resize', () => {
    ResizeWindow();
})
function ResizeWindow(){
    var jmediaquery = window.matchMedia("(min-width: 750px)")
    if (jmediaquery.matches) {
        console.log('ran');
        document.getElementById('logo-alt').innerHTML = 'Game Dev Student';
    }
    else {
        document.getElementById('logo-alt').innerHTML = '';
    }
}

function CreateNavBar() {
    let container = document.createElement('div');
    container.id = 'navigation-elements';
    let navbar = document.getElementById('nav');
    navbar.append(container);
    FillNavigationBar('products', '/products.html');
    FillNavigationBar('about', '/about.html');
}
function FillNavigationBar(name, url) {
    let container = document.getElementById('navigation-elements');
    let title = document.createElement('button');
    title.setAttribute('onclick', `location.href="${url}";`);
    title.setAttribute('value', `button for ${name}`);
    title.innerText = name;
    let tmp = document.createElement('h1');
    tmp.append(title);
    container.append(tmp);
}