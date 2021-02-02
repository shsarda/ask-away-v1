# set location to data module
Set-Location -Path ..\source\msteams-app-questionly.data\

# npm install for data module
npm install

# build data module
npm run-script build

# Remove .cache from node modules
Remove-Item -r  .\node_modules\.cache\

# set location to common module
Set-Location -Path ..\msteams-app-questionly.common\

# do npm install for common module
npm install

# copy dist and package.json from data module
xcopy .\..\msteams-app-questionly.data\dist\* node_modules\msteams-app-questionly.data\dist\* /s /Y
xcopy .\..\msteams-app-questionly.data\package.json node_modules\msteams-app-questionly.data\  /Y

# build common module
npm run-script build

# set location to func module
Set-Location -Path ..\msteams-app-questionly.func\

# npm install for func module
npm install

# copy dist and package.json from data and common module
xcopy .\..\msteams-app-questionly.data\dist\* node_modules\msteams-app-questionly.data\dist\* /s /Y
xcopy .\..\msteams-app-questionly.data\package.json node_modules\msteams-app-questionly.data\  /Y
xcopy .\..\msteams-app-questionly.common\dist\* node_modules\msteams-app-questionly.common\dist\* /s /Y
xcopy .\..\msteams-app-questionly.common\package.json node_modules\msteams-app-questionly.common\  /Y

# build func module
npm run-script build

# set location to web app
Set-Location -Path ..\msteams-app-questionly\

# npm install for app
npm install

# copy dist and package.json from data and common module
xcopy .\..\msteams-app-questionly.data\dist\* node_modules\msteams-app-questionly.data\dist\* /s /Y
xcopy .\..\msteams-app-questionly.data\package.json node_modules\msteams-app-questionly.data\  /Y
xcopy .\..\msteams-app-questionly.common\dist\* node_modules\msteams-app-questionly.common\dist\* /s /Y
xcopy .\..\msteams-app-questionly.common\package.json node_modules\msteams-app-questionly.common\  /Y

# build web app
npm run-script build

# Remove .cache from node modules
Remove-Item -r  .\node_modules\.cache\

Set-Location -Path ..\

# create archive of web app
$compress = @{
    Path= "msteams-app-questionly"
    CompressionLevel = "Fastest"
    DestinationPath = "webApp.zip"
}
Compress-Archive @compress -Force
