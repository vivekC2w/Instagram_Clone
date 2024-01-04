import React from "react";

const UserAvatar = ({ item }) => {
  return (
    <div className="avatar-container">
      <img
        src={item.pic || "noAvatar.jpg"}
        alt={item.name}
        className="avatar-image"
      />
      <div className="">
        <div className="avatar-name">{item.name} </div>
        <div className="avatar-email">{item.email} </div>
      </div>
    </div>
  );
};

export default UserAvatar;
