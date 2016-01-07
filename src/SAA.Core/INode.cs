namespace SAA.Core
{
    public interface INode<TId>
    {
        TId Id { get; }
        INode<TId> Joint(INode<TId> neighbor);
    }
}