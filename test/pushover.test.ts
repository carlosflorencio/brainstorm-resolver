import Pushover from "../src/services/Pushover";

test('send message', () => {
    expect.assertions(1)

    return Pushover.send('Title', 'body').then(res => {
        expect(res).toBeNull()
    })
})

