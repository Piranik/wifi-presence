#!/bin/sh
interfaces="ath0 ath1"
macs=""
new_macs=""
in=""
out=""
iam=$1

while true; do

 for device in ${interfaces}; do
  new_macs="$new_macs $(iw dev $device station dump | grep Station | awk '{print $2}' | sed ':a;N;$!ba;s/\n/ /g')"
 done

 # Check for new client connections
 for mac in ${new_macs}; do
  test="$(echo $macs | grep $mac)"
  if [ "$test" = "" ]; then
    echo "new mac: $mac"
    in="$in+$mac"
  fi
 done

 # Check for client disconnects
 for mac in ${macs}; do
  test="$(echo $new_macs | grep $mac)"
  if [ "$test" = "" ]; then
   echo "disconnected mac: $mac"
   out="$out+$mac"
  fi
 done

 if [ "$in" != "" ] || [ "$out" != "" ] ; then
  new_macs="$(echo $new_macs | sed 's/ /+/g')"
  url=$(echo "http://192.168.0.25:3000/wificlients/?iam=$iam&clients=$new_macs&in=$in&out=$out")
  echo "$url"
  wget "$url" -O /dev/null
 fi

 macs="$(echo $new_macs | sed 's/+/ /g')"
 new_macs=""
 in=""
 out=""
 sleep 3
done
