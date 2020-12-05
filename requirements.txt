
# Install Mongo

# Prerequisites
To follow this tutorial, you will need:

One Ubuntu 18.04 server. This server should have a non-root administrative user and a firewall configured with UFW. Set this up by following our initial server setup guide for Ubuntu 18.04.

* Step 1 — Installing MongoDB

Ubuntu’s official package repositories include a stable version of MongoDB. However, as of this writing, the version of MongoDB available from the default Ubuntu repositories is 3.6, while the latest stable release is 4.4.

To obtain the most recent version of this software, you must include MongoDB’s dedicated package repository to your APT sources. Then, you’ll be able to install mongodb-org, a meta-package that always points to the latest version of MongoDB.

To start, import the public GPG key for the latest stable version of MongoDB by running the following command. If you intend to use a version of MongoDB other than 4.4, be sure to change 4.4 in the URL portion of this command to align with the version you want to install:
```
curl -fsSL https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
```
cURL is a command line tool available on many operating systems used to transfer data. It reads whatever data is stored at the URL passed to it and prints the content to the system’s output. In the following example, cURL prints the content of the GPG key file and then pipes it into the following sudo apt-key add - command, thereby adding the GPG key to your list of trusted keys.

Also, note that this curl command uses the options -fsSL which, together, essentially tell cURL to fail silently. This means that if for some reason cURL isn’t able to contact the GPG server or the GPG server is down, it won’t accidentally add the resulting error code to your list of trusted keys.

This command will return OK if the key was added successfully:

Output
OK
If you’d like to double check that the key was added correctly, you can do so with the following command:
```
apt-key list
```
This will return the MongoDB key somewhere in the output:

Output
```
/etc/apt/trusted.gpg
--------------------
pub   rsa4096 2019-05-28 [SC] [expires: 2024-05-26]
      2069 1EEC 3521 6C63 CAF6  6CE1 6564 08E3 90CF B1F5
uid           [ unknown] MongoDB 4.2 Release Signing Key <packaging@mongodb.com>
. . .
```
At this point, your APT installation still doesn’t know where to find the mongodb-org package you need to install the latest version of MongoDB.

There are two places on your server where APT looks for online sources of packages to download and install: the sources.list file and the sources.list.d directory. sources.list is a file that lists active sources of APT data, with one source per line and the most preferred sources listed first. The sources.list.d directory allows you to add such sources.list entries as separate files.

Run the following command, which creates a file in the sources.list.d directory named mongodb-org-4.2.list. The only content in this file is a single line reading deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.4 multiverse:
```
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
```
This single line tells APT everything it needs to know about what the source is and where to find it:

deb: This means that the source entry references a regular Debian architecture. In other cases, this part of the line might read deb-src, which means the source entry represents a Debian distribution’s source code.
[ arch=amd64,arm64 ]: This specifies which architectures the APT data should be downloaded to. In this case, it specifies the amd64 and arm64 architectures.
https://repo.mongodb.org/apt/ubuntu: This is a URI representing the location where the APT data can be found. In this case, the URI points to the HTTPS address where the official MongoDB repository is located.
bionic/mongodb-org/4.4: Ubuntu repositories can contain several different releases. This specifies that you only want version 4.4 of the mongodb-org package available for the bionic release of Ubuntu (“Bionic Beaver” being the code name of Ubuntu 18.04).
multiverse: This part points APT to one of the four main Ubuntu repositories. In this case, it’s pointing to the multiverse repository.
After running this command, update your server’s local package index so APT knows where to find the mongodb-org package:
```
sudo apt update
```
Following that, you can install MongoDB:
```
sudo apt install mongodb-org
```
When prompted, press Y and then ENTER to confirm that you want to install the package.

When the command finishes, MongoDB will be installed on your system. However it isn’t yet ready to use. Next, you’ll start MongoDB and confirm that it’s working correctly.

* Step 2 — Starting the MongoDB Service and Testing the Database
The installation process described in the previous step automatically configures MongoDB to run as a daemon controlled by systemd, meaning you can manage MongoDB using the various systemctl commands. However, this installation procedure doesn’t automatically start the service.

Run the following systemctl command to start the MongoDB service:
```
sudo systemctl start mongod.service
```
Then check the service’s status. Notice that this command doesn’t include .service in the service file definition. systemctl will append this suffix to whatever argument you pass automatically if it isn’t already present, so it isn’t necessary to include it:
```
sudo systemctl status mongod
```
This command will return output like the following, indicating that the service is up and running:
```
Output
● mongod.service - MongoDB Database Server
   Loaded: loaded (/lib/systemd/system/mongod.service; disabled; vendor preset: enabled)
   Active: active (running) since Tue 2020-10-06 15:08:09 UTC; 6s ago
     Docs: https://docs.mongodb.org/manual
 Main PID: 13429 (mongod)
   CGroup: /system.slice/mongod.service
           └─13429 /usr/bin/mongod --config /etc/mongod.conf
```
After confirming that the service is running as expected, enable the MongoDB service to start up at boot:
```
sudo systemctl enable mongod
```
You can further verify that the database is operational by connecting to the database server and executing a diagnostic command. The following command will connect to the database and output its current version, server address, and port. It will also return the result of MongoDB’s internal connectionStatus command:
```
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
```
connectionStatus will check and return the status of the database connection. A value of 1 for the ok field in the response indicates that the server is working as expected:
```
Output
MongoDB shell version v4.2.1
connecting to: mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb
Implicit session: session { "id" : UUID("2244c4df-38a3-4109-9fd2-68948865647a") }
MongoDB server version: 4.2.1
{
    "authInfo" : {
        "authenticatedUsers" : [ ],
        "authenticatedUserRoles" : [ ]
    },
    "ok" : 1
}
```
Also, note that the database is running on port 27017 on 127.0.0.1, the local loopback address representing localhost. This is MongoDB’s default port number.

Next, we’ll look at how to manage the MongoDB server instance with systemd.

* Step 3 — Managing the MongoDB Service
As mentioned previously, the installation process described in Step 1 configures MongoDB to run as a systemd service. This means that you can manage it using standard systemctl commands as you would with other Ubuntu system services.

As mentioned previously, the systemctl status command checks the status of the MongoDB service:
```
sudo systemctl status mongod
```
You can stop the service anytime by typing:
```
sudo systemctl stop mongod
```
To start the service when it’s stopped, run:
```
sudo systemctl start mongod
```
You can also restart the server when it’s already running:
```
sudo systemctl restart mongod
```
In Step 2, you enabled MongoDB to start automatically with the server. If you ever wish to disable this automatic startup, type:
```
sudo systemctl disable mongod
```
Then to re-enable it to start up at boot, run the enable command again:
```
sudo systemctl enable mongod
```
For more information on how to manage systemd services, check out Systemd Essentials: Working with Services, Units, and the Journal.

## Conclusion
In this tutorial, you added the official MongoDB repository to your APT instance, and installed the latest version of MongoDB. You then tested Mongo’s functionality and practiced some systemctl commands.

As an immediate next step, we strongly recommend that you harden your MongoDB installation’s security by following our guide on How To Secure MongoDB on Ubuntu 18.04. Once it’s secured, you could then configure MongoDB to accept remote connections.

You can find more tutorials on how to configure and use MongoDB in these DigitalOcean community articles. We also encourage you to check out the official MongoDB documentation, as it’s a great resource on the possibilities that MongoDB provides.
