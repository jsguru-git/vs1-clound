export default class layoutEditor {
  constructor(element) {
    if (element == null) {
      return null;
    }

    console.log(element);

    this.save = element.querySelector(".saveTable"); // save button

    this.bindEvents();
    console.log("Layout editor loaded");
  }

  setupTree() {
    const sortableAccounts = document.querySelectorAll(".sortableAccount");
    sortableAccounts.forEach((sortableAccount) => {
        const accountType = sortableAccount.querySelector('.avoid').getAttribute('account-type');
        sortableAccount.setAttribute('account-type', accountType);

        const draggables = sortableAccount.querySelectorAll('.draggable');
        draggables.forEach((draggable) => {
            draggable.setAttribute('account-type', accountType);
        })
    })
  }

  buildTree() {
    const sortableAccounts = document.querySelectorAll(".sortableAccount");
  }

  bindEvents() {
    // this is our edit listener
    $(this.save).on("click", (e) => {
      e.preventDefault();
      console.log(e);
      const sortableAccounts =
        document.querySelectorAll(".sortableAccount");
      console.log(sortableAccounts.length);
      this.setupTree();

      // this will add a position attribute to each sortableAccount
      for (let i = 0; i < sortableAccounts.length; i++) {
        let sortableAccount = sortableAccounts[i];
        sortableAccount.setAttribute("position", i);

        // this will add a position attribute to each draggable items of this sortableAccount
        const draggables = sortableAccount.querySelectorAll(".draggable");
        for (let si = 0; si < draggables.length; si++) {
          let draggable = draggables[si];
          draggable.setAttribute("position", si);
        }
      }

      // now we'll have to build the new object
    });

    $(".sortableAccountParent").sortable({
      revert: true,
      cancel: ".undraggableDate,.accdate,.edtInfo",
    });
    $(".sortableAccount").sortable({
      revert: true,
      handle: ".avoid",
    });
    $(".draggable").draggable({
      connectToSortable: ".sortableAccount",
      helper: "none",
      revert: "true",
    });
  }
}
