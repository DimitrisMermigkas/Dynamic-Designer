window.pmJsLib = {
  getLabels: () => JSON.stringify({}),
  getVideos: () => JSON.stringify({}),
  getSupportingPlaylistItems: () =>
    '[{"ID":"02392ed6-721e-43fc-8579-a7fb378b8aba","PlaylistID":"3037f0ff-112b-4934-91b0-622502109fd6","Type":"Video","No":0,"Path":"54d20c4559d4445f9c5c993d0bb2bf92/Greece/My Library/Lux-1.mp4","Name":"Lux-1.mp4","Hash":"LBdqOOewXIQDcDI8bgvBlDGHVS0\\u003d","Repeat":1,"SupportsPlaylistItemID":"5c78fce3-8776-4054-bcae-2e824386b807","VideoDuration":55050,"FilePath":"https://www.w3schools.com/tags/movie.mp4"},{"ID":"c1d08a13-6167-4d29-a6fb-398ac3c4cf2b","PlaylistID":"3037f0ff-112b-4934-91b0-622502109fd6","Type":"Playlist","No":1,"ForeignItemID":"a805854e-336f-4083-920a-f7c0655b9444","Repeat":1,"SupportsPlaylistItemID":"5c78fce3-8776-4054-bcae-2e824386b807"}]',
  // JSON.stringify([
  //   {
  //     Name: "gomena.png",
  //     FilePath:
  //       "https://productmedev.blob.core.windows.net/54d20c4559d4445f9c5c993d0bb2bf92/Greece/My%20Library/gomena.png?sv=2023-11-03&st=2024-07-30T07%3A33%3A55Z&se=2024-07-30T10%3A13%3A55Z&sr=c&sp=rwl&sig=5v9I2hMbXZ6qYJHe7vUNkT%2BW0gtJ47ALZpTyXCWsM0o%3D&hash=FUbMfEw+UHcXwBiUzFcNeKSXxDk=",
  //   },
  //   {
  //     Name: "christmasAnimation.mp4",
  //     FilePath:
  //       "https://productmedev.blob.core.windows.net/54d20c4559d4445f9c5c993d0bb2bf92/Greece/My%20Library/christmasAnimation.mp4?sv=2023-11-03&st=2024-07-30T07%3A33%3A55Z&se=2024-07-30T10%3A13%3A55Z&sr=c&sp=rwl&sig=5v9I2hMbXZ6qYJHe7vUNkT%2BW0gtJ47ALZpTyXCWsM0o%3D&hash=ydK+IYF6a/kFoO1tmnNdE4Or5Qw=",
  //   },
  // ]),
  getItemsOfPlaylist: (playlistID) => {
    return '[{"ID":"80b9c164-6ed4-47e0-a85f-2df9b183a4f7","PlaylistID":"a805854e-336f-4083-920a-f7c0655b9444","Type":"Image","No":0,"Path":"https://productmedev.blob.core.windows.net/54d20c4559d4445f9c5c993d0bb2bf92/Greece/My%20Library/Games.png?sv\\u003d2024-05-04\\u0026se\\u003d2024-10-05T01%3A13%3A03Z\\u0026sr\\u003db\\u0026sp\\u003dr\\u0026sig\\u003dI%2BHSzXOFm9X%2BkOnPubiAMBARLboNhPBBbje5tC5UPUc%3D","Name":"Games.png","Hash":"L4jgEiyHFZiJ6cocpjT7HMbJYrQ\\u003d","Duration":5000,"Repeat":1,"FilePath":"https://www.w3schools.com/tags/img_girl.jpg"},{"ID":"125314cd-b169-49b8-88ac-a8dac22612ff","PlaylistID":"a805854e-336f-4083-920a-f7c0655b9444","Type":"Video","No":1,"Path":"https://productmedev.blob.core.windows.net/54d20c4559d4445f9c5c993d0bb2bf92/Greece/My%20Library/video.mp4?sv\\u003d2024-05-04\\u0026se\\u003d2024-10-05T01%3A13%3A03Z\\u0026sr\\u003db\\u0026sp\\u003dr\\u0026sig\\u003dE6K8JSaQXam8gjD2bae9oXj6yO3W6Vl95epDlIuvytc%3D","Name":"video.mp4","Hash":"Q4rTvyT+2TcIX/oQHtBs2yPjAAc\\u003d","Repeat":1,"VideoDuration":10027,"FilePath":"https://www.w3schools.com/tags/movie.mp4","StartDate":"2024-10-03T16:19:00.000","Schedule":"* * * * *","FinishDate":"2024-10-03T16:25:00.000"}]';
  },
  getDeviceBranchInfo: () =>
    JSON.stringify({
      deviceID: "",
      branchID: "B3A679CD-F721-446D-9BC0-40D960F423F4",
    }),
  tryMeBtn: () => {},
};
