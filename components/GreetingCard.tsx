export default function GreetingCard({ message }: { message: string }) {
    return (
        <div className="bg-white p-4 shadow rounded text-center">
            <h1 className="text-2xl font-bold">{message}</h1>
        </div>
    );
}
