

for d in nodes/node*/ ; do
    echo deleting $d;
    rm -r $d
done

echo deleting rpc_node;
rm -r nodes/rpc_node